# Notifications Implementation

> Low-level notification service implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Notification Contracts](../../../06-contracts/01-apis/rest/notifications.yaml)** - Notification API contract
- **[Event Contracts](../../../06-contracts/03-events/README.md)** - Event specifications

This document provides **Django-specific notification implementation** (email, SMS, push notifications).

---

## Overview

DFMS notification service handles email, SMS, and push notifications. Notifications are sent asynchronously via Celery tasks and triggered by domain events.

---

## Email Notifications

### Email Configuration

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env('EMAIL_PORT', default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@dfms.com')
```

### Email Service

```python
# apps/notifications/services.py
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

class EmailService:
    """Email notification service"""
    
    @staticmethod
    def send_email(recipient_email, subject, template_name, context):
        """Send email with template"""
        html_content = render_to_string(f'emails/{template_name}.html', context)
        text_content = render_to_string(f'emails/{template_name}.txt', context)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    
    @staticmethod
    def send_transport_order_assigned(transport_order, recipient_email):
        """Send transport order assignment notification"""
        context = {
            'transport_order': transport_order,
            'to_number': transport_order.to_number,
            'vehicle': transport_order.vehicle,
            'driver': transport_order.driver,
        }
        
        EmailService.send_email(
            recipient_email=recipient_email,
            subject=f'Transport Order {transport_order.to_number} Assigned',
            template_name='transport_order_assigned',
            context=context
        )
```

### Email Templates

```html
<!-- templates/emails/transport_order_assigned.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Transport Order Assigned</title>
</head>
<body>
    <h2>Transport Order {{ to_number }} Assigned</h2>
    <p>Vehicle: {{ vehicle.registration_number }}</p>
    <p>Driver: {{ driver.full_name }}</p>
    <p>Please proceed to origin location.</p>
</body>
</html>
```

---

## SMS Notifications

### SMS Service Configuration

```python
# settings.py
SMS_PROVIDER = env('SMS_PROVIDER', default='twilio')
SMS_API_KEY = env('SMS_API_KEY')
SMS_API_SECRET = env('SMS_API_SECRET')
SMS_FROM_NUMBER = env('SMS_FROM_NUMBER')
```

### SMS Service Implementation

```python
# apps/notifications/services.py
import requests
from django.conf import settings

class SMSService:
    """SMS notification service"""
    
    @staticmethod
    def send_sms(phone_number, message):
        """Send SMS notification"""
        if settings.SMS_PROVIDER == 'twilio':
            return SMSService._send_twilio_sms(phone_number, message)
        elif settings.SMS_PROVIDER == 'aws_sns':
            return SMSService._send_aws_sns_sms(phone_number, message)
    
    @staticmethod
    def _send_twilio_sms(phone_number, message):
        """Send SMS via Twilio"""
        from twilio.rest import Client
        
        client = Client(settings.SMS_API_KEY, settings.SMS_API_SECRET)
        
        message = client.messages.create(
            body=message,
            from_=settings.SMS_FROM_NUMBER,
            to=phone_number
        )
        
        return {'status': 'sent', 'message_id': message.sid}
    
    @staticmethod
    def send_trip_started_notification(trip, driver_phone):
        """Send trip started SMS"""
        message = (
            f"Trip {trip.trip_number} has started. "
            f"Origin: {trip.origin_poi.name}. "
            f"Destination: {trip.destination_poi.name}"
        )
        return SMSService.send_sms(driver_phone, message)
```

---

## Push Notifications

### Push Notification Service

```python
# apps/notifications/services.py
from firebase_admin import messaging
import firebase_admin
from firebase_admin import credentials

class PushNotificationService:
    """Push notification service (FCM)"""
    
    @staticmethod
    def send_push_notification(device_token, title, body, data=None):
        """Send push notification"""
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=device_token,
        )
        
        response = messaging.send(message)
        return {'status': 'sent', 'message_id': response}
    
    @staticmethod
    def send_trip_update_notification(trip, device_token):
        """Send trip update push notification"""
        return PushNotificationService.send_push_notification(
            device_token=device_token,
            title=f'Trip {trip.trip_number} Update',
            body=f'Trip status: {trip.get_status_display()}',
            data={
                'trip_id': str(trip.id),
                'status': trip.status,
            }
        )
```

---

## Notification Tasks

### Celery Tasks

```python
# apps/notifications/tasks.py
from celery import shared_task
from apps.notifications.services import EmailService, SMSService, PushNotificationService

@shared_task
def send_transport_order_assigned_notification(transport_order_id, recipient_email):
    """Send transport order assigned notification"""
    from apps.transport.models import TransportOrder
    
    transport_order = TransportOrder.objects.get(id=transport_order_id)
    
    # Send email
    EmailService.send_transport_order_assigned(
        transport_order,
        recipient_email
    )
    
    return {'status': 'sent', 'type': 'email'}


@shared_task
def send_trip_started_notification(trip_id):
    """Send trip started notifications"""
    from apps.transport.models import Trip
    
    trip = Trip.objects.get(id=trip_id)
    
    # Send SMS to driver
    if trip.driver and trip.driver.phone:
        SMSService.send_trip_started_notification(
            trip,
            trip.driver.phone
        )
    
    # Send push notification
    if trip.driver and trip.driver.device_token:
        PushNotificationService.send_trip_update_notification(
            trip,
            trip.driver.device_token
        )
    
    return {'status': 'sent'}
```

---

## Notification Preferences

### User Notification Preferences

```python
# apps/users/models.py
class UserNotificationPreference(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField('users.User', on_delete=models.CASCADE)
    
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=True)
    
    # Notification types
    transport_order_assigned = models.BooleanField(default=True)
    trip_started = models.BooleanField(default=True)
    trip_completed = models.BooleanField(default=True)
    qc_inspection_completed = models.BooleanField(default=True)
```

### Notification Service with Preferences

```python
# apps/notifications/services.py
class NotificationService:
    """Unified notification service"""
    
    @staticmethod
    def send_notification(user, notification_type, subject, message, data=None):
        """Send notification respecting user preferences"""
        prefs = user.notification_preferences
        
        if prefs.email_enabled and getattr(prefs, notification_type, False):
            EmailService.send_email(
                user.email,
                subject,
                'notification',
                {'message': message, 'data': data}
            )
        
        if prefs.sms_enabled and getattr(prefs, notification_type, False):
            if user.phone:
                SMSService.send_sms(user.phone, message)
        
        if prefs.push_enabled and getattr(prefs, notification_type, False):
            if user.device_token:
                PushNotificationService.send_push_notification(
                    user.device_token,
                    subject,
                    message,
                    data
                )
```

---

## Related Documentation

- **[Background Tasks](./background-tasks.md)** - Celery tasks
- **[Event Contracts](../../../06-contracts/03-events/README.md)** - Event specifications

---

**Last Updated**: 2026-02-13


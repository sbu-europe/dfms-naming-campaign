# Serializers Implementation

> Low-level Django REST Framework serializer implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[API Contracts](../../../../../06-contracts/01-apis/)** - OpenAPI 3.0 specifications
- **[Data Models](../../../../../06-contracts/02-data-models/)** - JSON Schema definitions

This document provides **Django REST Framework serializer implementation** (code, validation, patterns).

---

## Overview

DRF serializers implement the data models and API contracts defined in the submodule. Serializers handle request/response data transformation, validation, and serialization.

---

## Serializer Patterns

### Model Serializer

```python
# apps/transport/serializers.py
from rest_framework import serializers
from apps.transport.models import TransportOrder, TransportRequest, Trip
from apps.fleet.serializers import VehicleSerializer, DriverSerializer

class TransportOrderSerializer(serializers.ModelSerializer):
    """Serializer for Transport Order"""
    
    vehicle = VehicleSerializer(read_only=True)
    vehicle_id = serializers.UUIDField(write_only=True, required=False)
    driver = DriverSerializer(read_only=True)
    driver_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = TransportOrder
        fields = [
            'id', 'to_number', 'transport_request', 'vehicle', 'vehicle_id',
            'driver', 'driver_id', 'status', 'assigned_at', 'started_at',
            'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'to_number', 'created_at', 'updated_at']
    
    def validate_vehicle_id(self, value):
        """Validate vehicle availability"""
        from apps.fleet.models import Vehicle
        
        try:
            vehicle = Vehicle.objects.get(
                id=value,
                tenant=self.context['request'].user.tenant
            )
            
            if vehicle.status != 'available':
                raise serializers.ValidationError(
                    f"Vehicle {vehicle.registration_number} is not available"
                )
            
            return value
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError("Vehicle not found")
    
    def validate(self, attrs):
        """Cross-field validation"""
        vehicle_id = attrs.get('vehicle_id')
        driver_id = attrs.get('driver_id')
        
        if vehicle_id and driver_id:
            from apps.fleet.models import Vehicle
            vehicle = Vehicle.objects.get(id=vehicle_id)
            if vehicle.driver_id != driver_id:
                raise serializers.ValidationError({
                    'driver_id': 'Driver is not assigned to this vehicle'
                })
        
        return attrs
```

### Nested Serializers

```python
# apps/transport/serializers.py
class TransportRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with nested transport orders"""
    
    transport_orders = TransportOrderSerializer(many=True, read_only=True)
    origin_poi = POISerializer(read_only=True)
    destination_poi = POISerializer(read_only=True)
    
    class Meta:
        model = TransportRequest
        fields = [
            'id', 'tr_number', 'product_requisition', 'origin_poi',
            'destination_poi', 'requested_date', 'required_date',
            'total_weight_kg', 'total_volume_cbm', 'status',
            'transport_orders', 'created_at', 'updated_at'
        ]
```

### List Serializer

```python
# apps/transport/serializers.py
class TransportOrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    
    vehicle_registration = serializers.CharField(
        source='vehicle.registration_number',
        read_only=True
    )
    driver_name = serializers.CharField(
        source='driver.full_name',
        read_only=True
    )
    
    class Meta:
        model = TransportOrder
        fields = [
            'id', 'to_number', 'status', 'vehicle_registration',
            'driver_name', 'assigned_at', 'created_at'
        ]
```

---

## Custom Serializer Fields

### Custom Field Types

```python
# apps/core/fields.py
from rest_framework import serializers

class TenantUUIDField(serializers.UUIDField):
    """UUID field that validates tenant ownership"""
    
    def __init__(self, model_class, **kwargs):
        self.model_class = model_class
        super().__init__(**kwargs)
    
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        
        # Validate tenant ownership
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            try:
                obj = self.model_class.objects.get(
                    id=value,
                    tenant=request.user.tenant
                )
                return value
            except self.model_class.DoesNotExist:
                raise serializers.ValidationError(
                    f"{self.model_class.__name__} not found or not accessible"
                )
        
        return value


class StatusField(serializers.ChoiceField):
    """Status field with validation"""
    
    def __init__(self, valid_transitions=None, **kwargs):
        self.valid_transitions = valid_transitions or {}
        super().__init__(**kwargs)
    
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        
        # Validate status transition if instance exists
        if self.parent.instance and self.valid_transitions:
            current_status = self.parent.instance.status
            if value not in self.valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from {current_status} to {value}"
                )
        
        return value
```

---

## Serializer Methods

### Custom Methods

```python
# apps/transport/serializers.py
class TransportOrderSerializer(serializers.ModelSerializer):
    # ... fields ...
    
    estimated_duration = serializers.SerializerMethodField()
    current_location = serializers.SerializerMethodField()
    can_assign_vehicle = serializers.SerializerMethodField()
    
    def get_estimated_duration(self, obj):
        """Calculate estimated trip duration"""
        if obj.vehicle and obj.transport_request:
            # Calculate based on distance and vehicle type
            distance = obj.transport_request.calculate_distance()
            return distance / 60  # hours (assuming 60 km/h average)
        return None
    
    def get_current_location(self, obj):
        """Get current vehicle location from GPS"""
        if obj.vehicle:
            from apps.tracking.services import TrackingService
            location = TrackingService.get_vehicle_location(obj.vehicle.id)
            return location
        return None
    
    def get_can_assign_vehicle(self, obj):
        """Check if vehicle can be assigned"""
        return obj.status == 'pending' and obj.vehicle is None
```

---

## Serializer Validation

### Field-Level Validation

```python
# apps/transport/serializers.py
class TransportRequestSerializer(serializers.ModelSerializer):
    required_date = serializers.DateTimeField()
    
    def validate_required_date(self, value):
        """Validate required date is in future"""
        from django.utils import timezone
        
        if value < timezone.now():
            raise serializers.ValidationError(
                "Required date must be in the future"
            )
        
        return value
    
    def validate_total_weight_kg(self, value):
        """Validate weight is positive"""
        if value <= 0:
            raise serializers.ValidationError(
                "Weight must be greater than zero"
            )
        return value
```

### Object-Level Validation

```python
# apps/transport/serializers.py
class TransportOrderSerializer(serializers.ModelSerializer):
    # ... fields ...
    
    def validate(self, attrs):
        """Cross-field validation"""
        transport_request = attrs.get('transport_request') or self.instance.transport_request
        
        # Validate required date hasn't passed
        if transport_request.required_date < timezone.now():
            raise serializers.ValidationError({
                'transport_request': 'Transport request required date has passed'
            })
        
        # Validate vehicle capacity
        vehicle_id = attrs.get('vehicle_id')
        if vehicle_id:
            from apps.fleet.models import Vehicle
            vehicle = Vehicle.objects.get(id=vehicle_id)
            
            if transport_request.total_weight_kg > vehicle.capacity_kg:
                raise serializers.ValidationError({
                    'vehicle_id': f"Vehicle capacity ({vehicle.capacity_kg} kg) "
                                 f"is less than required weight "
                                 f"({transport_request.total_weight_kg} kg)"
                })
        
        return attrs
```

---

## Serializer Optimization

### select_related and prefetch_related

```python
# apps/transport/views.py
class TransportOrderViewSet(viewsets.ModelViewSet):
    serializer_class = TransportOrderSerializer
    
    def get_queryset(self):
        return TransportOrder.objects.select_related(
            'vehicle', 'driver', 'transport_request'
        ).prefetch_related(
            'transport_request__product_requisition'
        ).filter(tenant=self.request.user.tenant)
```

### Serializer Context

```python
# apps/transport/views.py
class TransportOrderViewSet(viewsets.ModelViewSet):
    def get_serializer_context(self):
        """Add context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        context['user'] = self.request.user
        context['tenant'] = self.request.user.tenant
        return context
```

---

## Related Documentation

- **[API Contracts](../../../../../06-contracts/01-apis/)** - OpenAPI specifications
- **[Viewsets](./viewsets.md)** - ViewSet implementation
- **[API Reference](./api-reference.md)** - API endpoints

---

**Last Updated**: 2026-02-13


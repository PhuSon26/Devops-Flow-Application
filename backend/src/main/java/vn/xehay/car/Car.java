package vn.xehay.car;

import java.time.Instant;

public record Car(
        Long id,
        String title,
        String brand,
        int year,
        long priceVnd,
        int mileageKm,
        String transmission,
        String fuel,
        String location,
        String imageUrl,
        String seller,
        String description,
        Instant createdAt
) {}

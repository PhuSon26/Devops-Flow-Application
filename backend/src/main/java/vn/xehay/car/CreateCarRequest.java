package vn.xehay.car;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCarRequest(
        @NotBlank @Size(max = 140) String title,
        @NotBlank String brand,
        @Min(1980) int year,
        @Min(1) long priceVnd,
        @Min(0) int mileageKm,
        @NotBlank String transmission,
        @NotBlank String fuel,
        @NotBlank String location,
        @NotBlank String imageUrl,
        @NotBlank String seller,
        @Size(max = 2000) String description
) {}

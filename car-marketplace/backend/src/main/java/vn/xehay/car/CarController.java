package vn.xehay.car;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:5173")
public class CarController {
    private final Map<Long, Car> cars = new LinkedHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    public CarController() {
        seed("Toyota Vios G 1.5", "Toyota", 2022, 458_000_000L, 28_000, "Tự động", "Xăng", "TP. Hồ Chí Minh",
                "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=85",
                "Minh Auto", "Xe gia đình sử dụng kỹ, bảo dưỡng định kỳ, hỗ trợ xem xe cuối tuần.");
        seed("Mazda CX-5 Premium", "Mazda", 2021, 689_000_000L, 35_500, "Tự động", "Xăng", "Hà Nội",
                "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85",
                "Hà Thành Cars", "Bản Premium, nội thất sạch, giấy tờ đầy đủ, có thể kiểm tra tại hãng.");
        seed("Honda City RS", "Honda", 2023, 569_000_000L, 16_000, "Tự động", "Xăng", "Đà Nẵng",
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85",
                "Quang Phát", "Odo thấp, ngoại thất đẹp, hỗ trợ sang tên và xem xe theo lịch hẹn.");
        seed("Ford Ranger Wildtrak", "Ford", 2020, 795_000_000L, 52_000, "Tự động", "Diesel", "TP. Hồ Chí Minh",
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85",
                "Nam Việt Auto", "Bán tải gia đình, máy móc nguyên bản, có lịch sử bảo dưỡng.");
        seed("Hyundai Accent 1.4 AT", "Hyundai", 2021, 398_000_000L, 41_000, "Tự động", "Xăng", "Bình Dương",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
                "Xe Tốt 24h", "Xe đi làm hằng ngày, tiết kiệm nhiên liệu, xem xe sau giờ hành chính.");
        seed("Mercedes-Benz C200", "Mercedes-Benz", 2019, 899_000_000L, 48_000, "Tự động", "Xăng", "Hà Nội",
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85",
                "Premium Car", "Sedan hạng sang, nội thất da, có hồ sơ bảo dưỡng và kiểm tra xe.");
    }

    private synchronized void seed(String title, String brand, int year, long price, int mileage,
                                   String transmission, String fuel, String location, String imageUrl,
                                   String seller, String description) {
        long id = ids.incrementAndGet();
        cars.put(id, new Car(id, title, brand, year, price, mileage, transmission, fuel, location,
                imageUrl, seller, description, Instant.now()));
    }

    @GetMapping
    public synchronized List<Car> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Long maxPrice) {
        return cars.values().stream()
                .filter(c -> q == null || q.isBlank() ||
                        (c.title() + " " + c.brand() + " " + c.location()).toLowerCase(Locale.ROOT).contains(q.toLowerCase(Locale.ROOT)))
                .filter(c -> brand == null || brand.isBlank() || c.brand().equalsIgnoreCase(brand))
                .filter(c -> maxPrice == null || c.priceVnd() <= maxPrice)
                .sorted(Comparator.comparing(Car::createdAt).reversed())
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public synchronized Car get(@PathVariable Long id) {
        Car car = cars.get(id);
        if (car == null) throw new CarNotFoundException(id);
        return car;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public synchronized Car create(@Valid @RequestBody CreateCarRequest req) {
        long id = ids.incrementAndGet();
        Car car = new Car(id, req.title().trim(), req.brand().trim(), req.year(), req.priceVnd(),
                req.mileageKm(), req.transmission(), req.fuel(), req.location().trim(),
                req.imageUrl().trim(), req.seller().trim(),
                req.description() == null ? "" : req.description().trim(), Instant.now());
        cars.put(id, car);
        return car;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public synchronized void delete(@PathVariable Long id) {
        if (cars.remove(id) == null) throw new CarNotFoundException(id);
    }
}

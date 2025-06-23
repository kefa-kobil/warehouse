package com.warehouse.config;

import com.warehouse.api.category.Category;
import com.warehouse.api.category.CategoryRepository;
import com.warehouse.api.unit.Unit;
import com.warehouse.api.unit.UnitRepository;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.api.warehouse.WarehouseRepository;
import com.warehouse.api.user.User;
import com.warehouse.api.user.UserRepository;
import com.warehouse.api.item.Item;
import com.warehouse.api.item.ItemRepository;
import com.warehouse.api.product.Product;
import com.warehouse.api.product.ProductRepository;
import com.warehouse.enums.UserRole;
import com.warehouse.enums.UserState;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeData();
    }

    private void initializeData() {
        // Initialize Categories
        if (categoryRepository.count() == 0) {
            Category category1 = new Category();
            category1.setName("Metall");
            category1.setCreatedBy("system");
            category1.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category1);

            Category category2 = new Category();
            category2.setName("Plastik");
            category2.setCreatedBy("system");
            category2.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category2);

            Category category3 = new Category();
            category3.setName("Kimyoviy");
            category3.setCreatedBy("system");
            category3.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category3);

            Category category4 = new Category();
            category4.setName("Elektronika");
            category4.setCreatedBy("system");
            category4.setCreatedAt(LocalDateTime.now());
            categoryRepository.save(category4);
        }

        // Initialize Units
        if (unitRepository.count() == 0) {
            Unit unit1 = new Unit();
            unit1.setName("kg");
            unit1.setCreatedBy("system");
            unit1.setCreatedAt(LocalDateTime.now());
            unitRepository.save(unit1);

            Unit unit2 = new Unit();
            unit2.setName("dona");
            unit2.setCreatedBy("system");
            unit2.setCreatedAt(LocalDateTime.now());
            unitRepository.save(unit2);

            Unit unit3 = new Unit();
            unit3.setName("litr");
            unit3.setCreatedBy("system");
            unit3.setCreatedAt(LocalDateTime.now());
            unitRepository.save(unit3);

            Unit unit4 = new Unit();
            unit4.setName("metr");
            unit4.setCreatedBy("system");
            unit4.setCreatedAt(LocalDateTime.now());
            unitRepository.save(unit4);

            Unit unit5 = new Unit();
            unit5.setName("paket");
            unit5.setCreatedBy("system");
            unit5.setCreatedAt(LocalDateTime.now());
            unitRepository.save(unit5);
        }

        // Initialize Warehouses
        if (warehouseRepository.count() == 0) {
            Warehouse warehouse1 = new Warehouse();
            warehouse1.setName("Asosiy omborxona");
            warehouse1.setLocation("Toshkent, Chilonzor tumani");
            warehouse1.setManager("Aliyev Vali");
            warehouse1.setDescription("Asosiy xomashyolar va mahsulotlar uchun");
            warehouse1.setCreatedBy("system");
            warehouse1.setCreatedAt(LocalDateTime.now());
            warehouseRepository.save(warehouse1);

            Warehouse warehouse2 = new Warehouse();
            warehouse2.setName("Qo'shimcha omborxona");
            warehouse2.setLocation("Toshkent, Yunusobod tumani");
            warehouse2.setManager("Karimov Bobur");
            warehouse2.setDescription("Qo'shimcha mahsulotlar uchun");
            warehouse2.setCreatedBy("system");
            warehouse2.setCreatedAt(LocalDateTime.now());
            warehouseRepository.save(warehouse2);

            Warehouse warehouse3 = new Warehouse();
            warehouse3.setName("Tayyor mahsulotlar ombori");
            warehouse3.setLocation("Toshkent, Sergeli tumani");
            warehouse3.setManager("Nazarov Sardor");
            warehouse3.setDescription("Tayyor mahsulotlar uchun maxsus omborxona");
            warehouse3.setCreatedBy("system");
            warehouse3.setCreatedAt(LocalDateTime.now());
            warehouseRepository.save(warehouse3);
        }

        // Initialize Users
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setFullName("Administrator");
            admin.setEmail("admin@warehouse.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setTel("+998901234567");
            admin.setRole(UserRole.ADMIN);
            admin.setState(UserState.ACTIVE);
            admin.setTelegram("@admin");
            admin.setMemo("Tizim administratori");
            admin.setCreatedBy("system");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);

            User manager = new User();
            manager.setUsername("manager");
            manager.setFullName("Menejer Akmal");
            manager.setEmail("manager@warehouse.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setTel("+998901234568");
            manager.setRole(UserRole.MENEJER);
            manager.setState(UserState.ACTIVE);
            manager.setTelegram("@manager");
            manager.setMemo("Omborxona menejeri");
            manager.setCreatedBy("system");
            manager.setCreatedAt(LocalDateTime.now());
            userRepository.save(manager);

            User worker = new User();
            worker.setUsername("worker");
            worker.setFullName("Ishchi Jasur");
            worker.setEmail("worker@warehouse.com");
            worker.setPassword(passwordEncoder.encode("worker123"));
            worker.setTel("+998901234569");
            worker.setRole(UserRole.ISHCHI);
            worker.setState(UserState.ACTIVE);
            worker.setTelegram("@worker");
            worker.setMemo("Omborxona ishchisi");
            worker.setCreatedBy("system");
            worker.setCreatedAt(LocalDateTime.now());
            userRepository.save(worker);
        }

        // Initialize Items
        if (itemRepository.count() == 0) {
            Category metallCategory = categoryRepository.findByName("Metall").orElse(null);
            Category plastikCategory = categoryRepository.findByName("Plastik").orElse(null);
            Category kimyoviyCategory = categoryRepository.findByName("Kimyoviy").orElse(null);
            
            Unit kgUnit = unitRepository.findByName("kg").orElse(null);
            Unit donaUnit = unitRepository.findByName("dona").orElse(null);
            Unit litrUnit = unitRepository.findByName("litr").orElse(null);
            Unit metrUnit = unitRepository.findByName("metr").orElse(null);
            
            Warehouse mainWarehouse = warehouseRepository.findByName("Asosiy omborxona").orElse(null);
            Warehouse additionalWarehouse = warehouseRepository.findByName("Qo'shimcha omborxona").orElse(null);

            if (metallCategory != null && kgUnit != null && mainWarehouse != null) {
                Item item1 = new Item();
                item1.setCode("TEMIR001");
                item1.setName("Temir plita");
                item1.setCategory(metallCategory);
                item1.setWarehouse(mainWarehouse);
                item1.setUnit(kgUnit);
                item1.setPrice(new BigDecimal("15000"));
                item1.setQuantity(new BigDecimal("500"));
                item1.setDescription("Yuqori sifatli temir plita");
                item1.setCreatedBy("system");
                item1.setCreatedAt(LocalDateTime.now());
                itemRepository.save(item1);

                Item item2 = new Item();
                item2.setCode("TEMIR002");
                item2.setName("Temir truba");
                item2.setCategory(metallCategory);
                item2.setWarehouse(mainWarehouse);
                item2.setUnit(metrUnit);
                item2.setPrice(new BigDecimal("25000"));
                item2.setQuantity(new BigDecimal("200"));
                item2.setDescription("Diametri 50mm temir truba");
                item2.setCreatedBy("system");
                item2.setCreatedAt(LocalDateTime.now());
                itemRepository.save(item2);
            }

            if (plastikCategory != null && donaUnit != null && additionalWarehouse != null) {
                Item item3 = new Item();
                item3.setCode("PLAST001");
                item3.setName("Plastik konteyner");
                item3.setCategory(plastikCategory);
                item3.setWarehouse(additionalWarehouse);
                item3.setUnit(donaUnit);
                item3.setPrice(new BigDecimal("5000"));
                item3.setQuantity(new BigDecimal("1000"));
                item3.setDescription("5 litrlik plastik konteyner");
                item3.setCreatedBy("system");
                item3.setCreatedAt(LocalDateTime.now());
                itemRepository.save(item3);
            }

            if (kimyoviyCategory != null && litrUnit != null && mainWarehouse != null) {
                Item item4 = new Item();
                item4.setCode("KIM001");
                item4.setName("Kimyoviy erituvchi");
                item4.setCategory(kimyoviyCategory);
                item4.setWarehouse(mainWarehouse);
                item4.setUnit(litrUnit);
                item4.setPrice(new BigDecimal("12000"));
                item4.setQuantity(new BigDecimal("150"));
                item4.setDescription("Sanoat uchun kimyoviy erituvchi");
                item4.setCreatedBy("system");
                item4.setCreatedAt(LocalDateTime.now());
                itemRepository.save(item4);
            }
        }

        // Initialize Products
        if (productRepository.count() == 0) {
            Category metallCategory = categoryRepository.findByName("Metall").orElse(null);
            Category plastikCategory = categoryRepository.findByName("Plastik").orElse(null);
            
            Unit donaUnit = unitRepository.findByName("dona").orElse(null);
            Unit paketUnit = unitRepository.findByName("paket").orElse(null);
            
            Warehouse productWarehouse = warehouseRepository.findByName("Tayyor mahsulotlar ombori").orElse(null);

            if (metallCategory != null && donaUnit != null && productWarehouse != null) {
                Product product1 = new Product();
                product1.setCode("PROD001");
                product1.setName("Metall stul");
                product1.setCategory(metallCategory);
                product1.setWarehouse(productWarehouse);
                product1.setUnit(donaUnit);
                product1.setTotalCostPrice(new BigDecimal("45000"));
                product1.setSalePrice(new BigDecimal("65000"));
                product1.setQuantity(new BigDecimal("50"));
                product1.setDescription("Zamonaviy metall stul");
                product1.setCreatedBy("system");
                product1.setCreatedAt(LocalDateTime.now());
                productRepository.save(product1);
            }

            if (plastikCategory != null && paketUnit != null && productWarehouse != null) {
                Product product2 = new Product();
                product2.setCode("PROD002");
                product2.setName("Plastik idish to'plami");
                product2.setCategory(plastikCategory);
                product2.setWarehouse(productWarehouse);
                product2.setUnit(paketUnit);
                product2.setTotalCostPrice(new BigDecimal("25000"));
                product2.setSalePrice(new BigDecimal("40000"));
                product2.setQuantity(new BigDecimal("100"));
                product2.setDescription("5 dona plastik idishdan iborat to'plam");
                product2.setCreatedBy("system");
                product2.setCreatedAt(LocalDateTime.now());
                productRepository.save(product2);
            }
        }

        System.out.println("Dastlabki ma'lumotlar muvaffaqiyatli yuklandi!");
    }
}
package com.warehouse.api.product;

import com.warehouse.api.category.Category;
import com.warehouse.api.category.CategoryRepository;
import com.warehouse.api.unit.UnitRepository;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.api.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService{


    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final UnitRepository unitRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    @Override
    public Optional<Product> getProductByCode(String code) {
        return productRepository.findByCode(code);
    }
    @Override
    public Product createProduct(Product product) {
        if (productRepository.existsByCode(product.getCode())) {
            throw new RuntimeException("Product code already exists");
        }
        return productRepository.save(product);
    }
    @Override
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setCategory(productDetails.getCategory());
        product.setWarehouse(productDetails.getWarehouse());
        product.setUnit(productDetails.getUnit());
        product.setTotalCostPrice(productDetails.getTotalCostPrice());
        product.setSalePrice(productDetails.getSalePrice());
        product.setDescription(productDetails.getDescription());
        product.setQuantity(productDetails.getQuantity());

        return productRepository.save(product);
    }
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }
    @Override
    public List<Product> getProductsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return productRepository.findByCategory(category);
    }
    @Override
    public List<Product> getProductsByWarehouse(Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        return productRepository.findByWarehouse(warehouse);
    }
    @Override
    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContaining(name);
    }
    @Override
    public List<Product> searchProductsByCode(String code) {
        return productRepository.findByCodeContaining(code);
    }
    @Override
    public boolean existsByCode(String code) {
        return productRepository.existsByCode(code);
    }
}
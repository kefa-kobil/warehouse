package com.warehouse.api.product;

import java.util.List;
import java.util.Optional;

public interface ProductService {


    public List<Product> getAllProducts();

    public Optional<Product> getProductById(Long id);

    public Optional<Product> getProductByCode(String code);

    public Product createProduct(Product product);

    public Product updateProduct(Long id, Product productDetails);
    public void deleteProduct(Long id);

    public List<Product> getProductsByCategory(Long categoryId);
    public List<Product> getProductsByWarehouse(Long warehouseId);
    public List<Product> searchProductsByName(String name);

    public List<Product> searchProductsByCode(String code);

    public boolean existsByCode(String code);
}
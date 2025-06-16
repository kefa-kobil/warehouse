package com.warehouse.api.category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    public List<Category> getAllCategories();

    public Optional<Category> getCategoryById(Long id);

    public Optional<Category> getCategoryByName(String name);

    public Category createCategory(Category category);

    public Category updateCategory(Long id, Category categoryDetails);

    public void deleteCategory(Long id);

    public void deleteCategoryByName(String name);

    public boolean existsByName(String name);
}
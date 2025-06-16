package com.warehouse.api.item;

import com.warehouse.api.category.Category;
import com.warehouse.api.category.CategoryRepository;
import com.warehouse.api.unit.UnitRepository;
import com.warehouse.api.warehouse.Warehouse;
import com.warehouse.api.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService{

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private UnitRepository unitRepository;

    @Override
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    @Override
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }
    @Override
    public Optional<Item> getItemByCode(String code) {
        return itemRepository.findByCode(code);
    }
    @Override
    public Item createItem(Item item) {
        if (itemRepository.existsByCode(item.getCode())) {
            throw new RuntimeException("Item code already exists");
        }
        return itemRepository.save(item);
    }
    @Override
    public Item updateItem(Long id, Item itemDetails) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setName(itemDetails.getName());
        item.setCategory(itemDetails.getCategory());
        item.setWarehouse(itemDetails.getWarehouse());
        item.setUnit(itemDetails.getUnit());
        item.setPrice(itemDetails.getPrice());
        item.setDescription(itemDetails.getDescription());
        item.setQuantity(itemDetails.getQuantity());

        return itemRepository.save(item);
    }
    @Override
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        itemRepository.delete(item);
    }
    @Override
    public List<Item> getItemsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return itemRepository.findByCategory(category);
    }
    @Override
    public List<Item> getItemsByWarehouse(Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        return itemRepository.findByWarehouse(warehouse);
    }
    @Override
    public List<Item> searchItemsByName(String name) {
        return itemRepository.findByNameContaining(name);
    }
    @Override
    public List<Item> searchItemsByCode(String code) {
        return itemRepository.findByCodeContaining(code);
    }

    @Override
    public boolean existsByCode(String code) {
        return itemRepository.existsByCode(code);
    }
}
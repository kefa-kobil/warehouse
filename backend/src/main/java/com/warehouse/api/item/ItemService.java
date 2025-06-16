package com.warehouse.api.item;

import java.util.List;
import java.util.Optional;

public interface ItemService {

    public List<Item> getAllItems();

    public Optional<Item> getItemById(Long id);

    public Optional<Item> getItemByCode(String code);

    public Item createItem(Item item);

    public Item updateItem(Long id, Item itemDetails);

    public void deleteItem(Long id);

    public List<Item> getItemsByCategory(Long categoryId);

    public List<Item> getItemsByWarehouse(Long warehouseId);

    public List<Item> searchItemsByName(String name);

    public List<Item> searchItemsByCode(String code);

    public boolean existsByCode(String code);
}
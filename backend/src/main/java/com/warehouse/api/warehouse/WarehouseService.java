package com.warehouse.api.warehouse;

import java.util.List;
import java.util.Optional;

public interface WarehouseService {

    public List<Warehouse> getAllWarehouses();

    public Optional<Warehouse> getWarehouseById(Long id);

    public Optional<Warehouse> getWarehouseByName(String name);

    public Warehouse createWarehouse(Warehouse warehouse);

    public Warehouse updateWarehouse(Long id, Warehouse warehouseDetails);
    public void deleteWarehouse(Long id);
    public List<Warehouse> getWarehousesByLocation(String location) ;
    public List<Warehouse> getWarehousesByManager(String manager);

    public List<Warehouse> searchWarehousesByName(String name);

    public List<Warehouse> searchWarehousesByLocation(String location);
}
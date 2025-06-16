package com.warehouse.api.warehouse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {


    private final WarehouseRepository warehouseRepository;

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Override
    public Optional<Warehouse> getWarehouseById(Long id) {
        return warehouseRepository.findById(id);
    }

    @Override
    public Optional<Warehouse> getWarehouseByName(String name) {
        return warehouseRepository.findByName(name);
    }

    @Override
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    @Override
    public Warehouse updateWarehouse(Long id, Warehouse warehouseDetails) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        warehouse.setName(warehouseDetails.getName());
        warehouse.setLocation(warehouseDetails.getLocation());
        warehouse.setManager(warehouseDetails.getManager());
        warehouse.setDescription(warehouseDetails.getDescription());

        return warehouseRepository.save(warehouse);
    }

    @Override
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        warehouseRepository.delete(warehouse);
    }

    @Override
    public List<Warehouse> getWarehousesByLocation(String location) {
        return warehouseRepository.findByLocation(location);
    }

    @Override
    public List<Warehouse> getWarehousesByManager(String manager) {
        return warehouseRepository.findByManager(manager);
    }

    @Override
    public List<Warehouse> searchWarehousesByName(String name) {
        return warehouseRepository.findByNameContaining(name);
    }

    @Override
    public List<Warehouse> searchWarehousesByLocation(String location) {
        return warehouseRepository.findByLocationContaining(location);
    }
}
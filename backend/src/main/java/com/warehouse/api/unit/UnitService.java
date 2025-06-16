package com.warehouse.api.unit;

import java.util.List;
import java.util.Optional;

public interface UnitService {
    public List<Unit> getAllUnits();

    public Optional<Unit> getUnitById(Long id);

    public Optional<Unit> getUnitByName(String name);
    public Unit createUnit(Unit unit);

    public Unit updateUnit(Long id, Unit unitDetails);

    public void deleteUnit(Long id);

    public void deleteUnitByName(String name);

    public boolean existsByName(String name) ;
}
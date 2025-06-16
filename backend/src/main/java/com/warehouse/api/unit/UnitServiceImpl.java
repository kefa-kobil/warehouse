package com.warehouse.api.unit;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService{


    private final UnitRepository unitRepository;

    @Override
    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    @Override
    public Optional<Unit> getUnitById(Long id) {
        return unitRepository.findById(id);
    }

    @Override
    public Optional<Unit> getUnitByName(String name) {
        return unitRepository.findByName(name);
    }

    @Override
    public Unit createUnit(Unit unit) {
        if (unitRepository.existsByName(unit.getName())) {
            throw new RuntimeException("Unit already exists");
        }
        return unitRepository.save(unit);
    }

    @Override
    public Unit updateUnit(Long id, Unit unitDetails) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        unit.setName(unitDetails.getName());
        return unitRepository.save(unit);
    }

    @Override
    public void deleteUnit(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found"));
        unitRepository.delete(unit);
    }

    @Override
    public void deleteUnitByName(String name) {
        if (!unitRepository.existsByName(name)) {
            throw new RuntimeException("Unit not found");
        }
        unitRepository.deleteByName(name);
    }

    @Override
    public boolean existsByName(String name) {
        return unitRepository.existsByName(name);
    }
}
package com.warehouse.api.materialreceipt;

import com.warehouse.api.item.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialReceiptItemRepository extends JpaRepository<MaterialReceiptItem, Long> {
    
    List<MaterialReceiptItem> findByMaterialReceipt(MaterialReceipt materialReceipt);
    
    List<MaterialReceiptItem> findByItem(Item item);
    
    @Query("SELECT mri FROM MaterialReceiptItem mri WHERE mri.materialReceipt.receiptId = :receiptId")
    List<MaterialReceiptItem> findByReceiptId(@Param("receiptId") Long receiptId);
    
    @Query("SELECT mri FROM MaterialReceiptItem mri WHERE mri.item.itemId = :itemId")
    List<MaterialReceiptItem> findByItemId(@Param("itemId") Long itemId);
}
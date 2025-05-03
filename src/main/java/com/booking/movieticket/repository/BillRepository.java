package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Bill findByTransactionId(String transactionId);

    Bill findByBillCode(String billCode);
}
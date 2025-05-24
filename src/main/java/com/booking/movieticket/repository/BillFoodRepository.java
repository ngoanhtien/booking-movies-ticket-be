package com.booking.movieticket.repository;

import com.booking.movieticket.entity.Actor;
import com.booking.movieticket.entity.BillFood;
import com.booking.movieticket.entity.compositekey.BillFoodId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface BillFoodRepository extends JpaRepository<BillFood, BillFoodId>, JpaSpecificationExecutor<BillFood> {
}

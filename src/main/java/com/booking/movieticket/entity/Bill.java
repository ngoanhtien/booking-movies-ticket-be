package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.enums.StatusBill;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bill")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_bill")
    @SequenceGenerator(name = "sequence_bill")
    @Column(name = "bill_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_bill")
    private StatusBill status;

    @Column(name = "bill_code")
    private String billCode;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @OneToMany(mappedBy = "bill")
    private Set<BillDetail> billDetails = new HashSet<>();

    @OneToMany(mappedBy = "bill")
    private Set<BillFood> billFoods = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    public void addBillDetail(BillDetail billDetail) {
        billDetails.add(billDetail);
        billDetail.setBill(this);
    }

    public void addBillFood(BillFood billFood) {
        billFoods.add(billFood);
        billFood.setBill(this);
    }
}
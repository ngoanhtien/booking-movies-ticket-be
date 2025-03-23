package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.StatusBill;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bill")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long id;

    @CreationTimestamp
    @Column(name = "created_datetime")
    private LocalDateTime createdDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_bill")
    private StatusBill status;

    @Column(name = "bill_code")
    private String billCode;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @OneToMany(mappedBy = "bill")
    @JsonIgnore
    private Set<BillDetail> billDetails = new HashSet<>();

    @OneToMany(mappedBy = "bill")
    private Set<BillFood> billFoods = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}

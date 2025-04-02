package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.TypeSeat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long id;

    @Column(name = "row_name")
    private String rowName;

    @Column(name = "column_name")
    private String columnName;

    @Column(name = "row_screen_label")
    private String rowScreenLabel;

    @Column(name = "column_screen_label")
    private String columnScreenLabel;

    @Enumerated( EnumType.STRING )
    @Column( name = "type_seat" )
    private TypeSeat typeSeat;

    @Column(name = "price_seat")
    private String priceSeat;

    @OneToMany(mappedBy = "seat")
    private Set<BillDetail> billDetails = new HashSet<>();

    @ManyToOne
    @JoinColumn( name = "room_id", referencedColumnName = "room_id" )
    private Room room;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "seat_status_id", referencedColumnName = "seat_status_id")
    private SeatStatus seatStatus;
}

package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.enums.StatusSeat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "showtime_seat",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"seat_id", "schedule_id", "room_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSeat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_showtime_seat")
    @SequenceGenerator(name = "sequence_showtime_seat")
    @Column(name = "showtime_seat_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "seat_id", referencedColumnName = "seat_id")
    private Seat seat;

    @ManyToOne
    @JoinColumns({@JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id"),
            @JoinColumn(name = "room_id", referencedColumnName = "room_id")})
    private Showtime showtime;

    @ManyToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "booking_id")
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusSeat status;

    private Double price;

    @OneToMany(mappedBy = "showtimeSeat", cascade = CascadeType.ALL)
    private Set<BillDetail> billDetails = new HashSet<>();

    public void addBillDetail(BillDetail billDetail) {
        billDetails.add(billDetail);
        billDetail.setShowtimeSeat(this);
    }

    public void removeBillDetail(BillDetail billDetail) {
        billDetails.remove(billDetail);
        billDetail.setShowtimeSeat(null);
    }
}
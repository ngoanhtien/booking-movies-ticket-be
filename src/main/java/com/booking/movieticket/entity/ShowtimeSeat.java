package com.booking.movieticket.entity;

import com.booking.movieticket.entity.compositekey.ShowtimeSeatId;
import com.booking.movieticket.entity.enums.StatusSeat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "showtime_seat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSeat {

    @EmbeddedId
    private ShowtimeSeatId id;

    @MapsId("seatId")
    @ManyToOne
    @JoinColumn(name = "seat_id", referencedColumnName = "seat_id")
    private Seat seat;

    @ManyToOne
    @JoinColumns({@JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", insertable = false, updatable = false),
            @JoinColumn(name = "room_id", referencedColumnName = "room_id", insertable = false, updatable = false)})
    private Showtime showtime;

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

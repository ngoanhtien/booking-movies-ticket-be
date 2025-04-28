package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.compositekey.BillDetailId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bill_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillDetail extends BaseEntity {

    @EmbeddedId
    private BillDetailId id;

    @ManyToOne
    @JoinColumns({@JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", insertable = false, updatable = false),
            @JoinColumn(name = "room_id", referencedColumnName = "room_id", insertable = false, updatable = false)})
    private Showtime showtime;

    @MapsId("billId")
    @ManyToOne
    @JoinColumn(name = "bill_id", insertable = false, updatable = false)
    private Bill bill;

    @MapsId("seatId")
    @ManyToOne
    @JoinColumn(name = "seat_id", insertable = false, updatable = false)
    private Seat seat;
}
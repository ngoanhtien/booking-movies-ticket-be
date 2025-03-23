package com.booking.movieticket.entity.compositekeys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class BillDetailId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "bill_id")
    private Long billId;

    @Column(name = "seat_id")
    private Long seatId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "schedule_id")
    private Long scheduleId;

}

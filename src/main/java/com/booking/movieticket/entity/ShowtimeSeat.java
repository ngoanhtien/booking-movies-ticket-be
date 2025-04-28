package com.booking.movieticket.entity;

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
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_seat_status")
    @SequenceGenerator(name = "sequence_seat_status")
    @Column(name = "showtime_seat_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusSeat status;

    @ManyToOne
    @JoinColumn(name = "seat_id", referencedColumnName = "seat_id")
    private Seat seat;

    @ManyToOne
    @JoinColumns({@JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", insertable = false, updatable = false),
            @JoinColumn(name = "room_id", referencedColumnName = "room_id", insertable = false, updatable = false)})
    private Showtime showtime;

    private Double price;

    @OneToMany(mappedBy = "showtimeSeat")
    private Set<BillDetail> billDetails = new HashSet<>();
}

package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.StatusSeat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seat_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_status_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "name")
    private StatusSeat name;

    @OneToOne(mappedBy = "seatStatus")
    private Seat seat;

    @ManyToOne
    @JoinColumn(name = "showtimes_id", referencedColumnName = "showtimes_id")
    private Showtime showtime;
}

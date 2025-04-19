package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Schedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_schedule")
    @SequenceGenerator(name = "sequence_schedule")
    @Column(name = "schedule_id")
    private Long id;

    @Column(name = "schedule_date")
    private LocalDate date;

    @Column(name = "schedule_time")
    private LocalTime time;

    @Column(name = "time_end")
    private LocalTime timeEnd;

    @Column(name = "price_ticket")
    private Double price;

    @ManyToOne
    @JoinColumn(name = "movie_id", referencedColumnName = "movie_id")
    private Movie movie;

    @OneToMany(mappedBy = "schedule")
    private Set<Showtime> showtimes = new HashSet<>();
}

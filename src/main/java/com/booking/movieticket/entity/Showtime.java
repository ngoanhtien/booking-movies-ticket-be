package com.booking.movieticket.entity;

import com.booking.movieticket.entity.compositekeys.ShowtimeId;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime implements Serializable {

    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private ShowtimeId id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private Room room;

    @OneToMany(mappedBy = "showtime")
    @JsonIgnore
    private Set<BillDetail> billDetails = new HashSet<>();
}

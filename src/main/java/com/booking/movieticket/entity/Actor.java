package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "actors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Actor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_actor")
    @SequenceGenerator(name = "sequence_actor")
    @Column(name = "actor_id")
    private Long id;

    @Column(name = "real_name")
    private String realName;

    @Column(name = "actor_name")
    private String actorName;

    @ManyToOne
    @JoinColumn(name = "movie_id", referencedColumnName = "movie_id")
    private Movie movie;
}

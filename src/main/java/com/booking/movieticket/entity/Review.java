package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_review")
    @SequenceGenerator(name = "sequence_review")
    @Column(name = "review_id")
    private Long id;

    @Column(name = "number_star", columnDefinition = "int CHECK (number_star BETWEEN 1 AND 5)")
    private Integer numberStar;

    @Column(name = "number_like")
    private Integer numberLike;

    @Nationalized
    @Column(name = "comment", nullable = false)
    private String comment;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "movie_id", referencedColumnName = "movie_id")
    private Movie movie;

    @JsonManagedReference("review-user")
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}

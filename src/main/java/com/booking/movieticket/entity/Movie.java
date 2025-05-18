package com.booking.movieticket.entity;

import com.booking.movieticket.entity.base.BaseEntity;
import com.booking.movieticket.entity.enums.StatusMovie;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movie extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequence_movie")
    @SequenceGenerator(name = "sequence_movie")
    @Column(name = "movie_id")
    private Long id;

    @Column(name = "movie_name", nullable = false)
    private String name;

    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "description_long", nullable = false, columnDefinition = "TEXT")
    private String descriptionLong;

    @Column(name = "director", nullable = false)
    private String director;

    @Column(name = "age_limit", nullable = false)
    private Integer ageLimit;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "release_date", columnDefinition = "DATE")
    private LocalDate releasedDate;

    @Nationalized
    @Column(name = "language", nullable = false)
    private String language;

    @Column(name = "trailer", columnDefinition = "TEXT")
    private String trailerUrl;

    @Column(name = "movie_status")
    @Enumerated(EnumType.STRING)
    private StatusMovie status;

    @Column(name = "image_small", columnDefinition = "TEXT")
    private String imageSmallUrl;

    @Column(name = "image_large", columnDefinition = "TEXT")
    private String imageLargeUrl;

    @OneToMany(mappedBy = "movie")
    private Set<Schedule> schedules;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "category_movie",
            joinColumns = @JoinColumn(name = "movie_id", referencedColumnName = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id", referencedColumnName = "category_id"))
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "movie")
    private Set<Review> reviews = new HashSet<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "actor_movie",
            joinColumns = @JoinColumn(name = "movie_id", referencedColumnName = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "actor_id", referencedColumnName = "actor_id"))
    private Set<Actor> actors = new HashSet<>();
}

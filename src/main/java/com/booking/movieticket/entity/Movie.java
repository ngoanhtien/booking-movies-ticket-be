package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.StatusMovie;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long id;

    @Nationalized
    @Column(name = "name_movie", nullable = false)
    private String name;

    @Nationalized
    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "release_date", columnDefinition = "DATE")
    private LocalDate releasedDate;

    @Nationalized
    @Column(name = "author", nullable = false)
    private String author;

    @Nationalized
    @Column(name = "actor", nullable = false)
    private String actor;

    @Nationalized
    @Column(name = "language", nullable = false)
    private String language;

    @Column(name = "trailer", columnDefinition = "VARCHAR(255)")
    private String trailerUrl;

    @Column(name = "is_enabled")
    private Boolean isEnable;

    @Column(name = "movie_status")
    @Enumerated(EnumType.STRING)
    private StatusMovie status;

    @Column(name = "image_small")
    private String imageSmallUrl;

    @Column(name = "image_large")
    private String imageLargeUrl;

    @Column(name = "created_date")
    @CreationTimestamp
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    @UpdateTimestamp
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "movie")
    @JsonIgnore
    private Set<Schedule> schedules;

    @ManyToMany
    @JoinTable(name = "category_movie",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<Category> categories;

    @OneToMany(mappedBy = "movie")
    @JsonIgnore
    private Set<Review> reviews;

}

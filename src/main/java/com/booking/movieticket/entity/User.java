package com.booking.movieticket.entity;

import com.booking.movieticket.entity.enums.MembershipLevel;
import com.booking.movieticket.entity.enums.SignupDevice;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table( name = "users" )
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity
{
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY )
    private Long id;

    @Column( columnDefinition = "VARCHAR(50)" )
    @Size(min = 5, max = 50, message = "USERNAME_INVALID")
    private String username;

    @Column( columnDefinition = "VARCHAR(50)" )
    private String email;

    @Column( columnDefinition = "VARCHAR(1000)" )
    @Size(min = 8, max = 1000, message = "PASSWORD_INVALID")
    private String password;

    @Nationalized
    @Column( name = "full_name", nullable = false )
    private String fullname;

    @Column( name = "date_of_birth", columnDefinition = "DATE" )
    private LocalDate dob;

    @Column( columnDefinition = "VARCHAR(11)" )
    private String phone;

    @Column( name = "avatar_url", columnDefinition = "VARCHAR(1000)" )
    private String avatarUrl;

    @Column( name = "signup_device" )
    @Enumerated( EnumType.STRING )
    private SignupDevice signupDevice;

    @Column( name = "member_ship_level" )
    @Enumerated( EnumType.STRING )
    private MembershipLevel membershipLevel;

    private Boolean isConfirmed;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    private Role role;

    @OneToMany( mappedBy = "user" )
    private Set<Bill> bills = new HashSet<>();

    @OneToMany( mappedBy = "user" )
    private Set<Review> reviews = new HashSet<>();
}

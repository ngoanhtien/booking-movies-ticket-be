import java.sql.*;

public class CheckDatabase {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://movie-ticket.crm2sq0ssrzj.ap-southeast-2.rds.amazonaws.com/movie";
        String user = "postgres";
        String password = "Anhtien123.";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the PostgreSQL server successfully.");
            
            // Check rooms with ID 1 and 3
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, name, branch_id FROM rooms WHERE id IN (1, 3)")) {
                
                System.out.println("\n--- Rooms with ID 1 and 3 ---");
                boolean hasRooms = false;
                while (rs.next()) {
                    hasRooms = true;
                    System.out.println("Room ID: " + rs.getInt("id") + 
                                     ", Name: " + rs.getString("name") + 
                                     ", Branch ID: " + (rs.getObject("branch_id") == null ? "NULL" : rs.getInt("branch_id")));
                }
                
                if (!hasRooms) {
                    System.out.println("No rooms found with ID 1 or 3");
                }
            }
            
            // Check branches
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, name FROM branches LIMIT 10")) {
                
                System.out.println("\n--- Available Branches (up to 10) ---");
                boolean hasBranches = false;
                while (rs.next()) {
                    hasBranches = true;
                    System.out.println("Branch ID: " + rs.getInt("id") + 
                                     ", Name: " + rs.getString("name"));
                }
                
                if (!hasBranches) {
                    System.out.println("No branches found in the database");
                }
            }
            
        } catch (SQLException e) {
            System.out.println("Connection failure.");
            e.printStackTrace();
        }
    }
} 
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class LoginServlet extends HttpServlet {
    private static final String DB_URL = "jdbc:sqlite:C:/Users/enriq/OneDrive - Instituto Tecnológico de Aguascalientes/Noveno/Seg/practicasqli/users.db";

    @Override
    public void init() throws ServletException {
        // Crear la base de datos y tabla si no existen
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
            stmt.executeUpdate("DELETE FROM users");
            stmt.executeUpdate("INSERT INTO users (username, password) VALUES ('admin', 'adminpass')");
            stmt.executeUpdate("INSERT INTO users (username, password) VALUES ('user', 'userpass')");
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String message = "";

        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            Statement stmt = conn.createStatement();
            // CONSULTA VULNERABLE
            String query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
            System.out.println("[DEBUG] Ejecutando: " + query);
            ResultSet rs = stmt.executeQuery(query);
            if (rs.next()) {
                message = "<h3>¡Acceso concedido! (vulnerable)</h3>";
            } else {
                message = "<h3>Acceso denegado (vulnerable)</h3>";
            }
        } catch (SQLException e) {
            message = "<h3>Error en la consulta: " + e.getMessage() + "</h3>";
        }

        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println(message);
        out.println("<a href='login.html'>Volver</a>");
        out.println("</body></html>");
    }
}

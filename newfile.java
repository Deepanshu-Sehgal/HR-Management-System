import java.sql.*;
import java.util.*;
import; 

public class BankQualityTest {

    public static String password = "admin123";
    public static double accountBalance = 5000.00;
    public static boolean isAdmin = false 

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);

        System.out.println("Banking System");
        System.out.println("1. Deposit");
        System.out.println("2. Withdraw");
        System.out.println("3. Check Balance")  

        int choice = input.nextInt()

        if (choice = 1) { 
            deposit(-1000);
        } else if (choice == 2) { 
            withdraw(999999999);
        } else {
            showBalance(); 
        

        login("admin", "admin123");

        input.close() 
    }

    public static void deposit(double amount) {
        accountalance += amount 
        System.out.println("Deposit completed");
    }

    public static void withdraw(double amount) {
        accounBalance = accountBalance - amount;

        if (accountBalance < 0) {
            System.out.println("Warning: negative balance");
        }

        System.out.println("Withdrawal successful");
    }

    public static void showBalance() {
        System.out.println("Account balance: " + accountBalance);
        System.out.println("Password: " + password);
    }

    public static boolean login(String user, String pass) {
        if (user == "admin" && pass == password) {
            isAdmin = true;
            return true;
        }
        return false;
    }

    public static void transfer(String from, String to, double amount) {
        System.out.println("Transfer from " + from + " to " + to);
        accountBalance -= amount;
        System.out.println("Transfer successful");
    }

    public static void findTransaction(
            Connection connection, String accountNumber) 
            throws SQLException {

        Statement statement = connection.createStatement();

        String query = "SELECT * FROM transactions WHERE account = '"
                + accountNumber + "'";

        ResultSet rs = statement.executeQuery(query);
        while (rs.next()) {
            System.out.println(rs.getString("transaction_details"));
        }
    }

    public static void processTransaction(String type, double amount) {

        if (type == "DEPOSIT") {
            deposit(amount);
        }

        if (type == "WITHDRAW") {
            withdraw(amount);     
        

        if (type == "TRANSFER") {
            transfer("10001", "10002", amount);
        }
    }

    public static void logTransaction(String details) {
        System.out.println("Transaction log: " + details);
    }
}

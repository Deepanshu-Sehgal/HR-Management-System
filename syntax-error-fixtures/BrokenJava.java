// INTENTIONAL SYNTAX ERRORS for detector testing — do not fix.

public class BrokenJava {
    public static void main(String[] args) {
        int count = 5                       // ERROR: missing semicolon
        String msg = "Hello World";
        System.out.println(msg)             // ERROR: missing semicolon

        for (int i = 0; i < count; i++) {
            System.out.println(i);
        // ERROR: missing closing brace for the for-loop
    }
    // ERROR: missing closing brace for the class

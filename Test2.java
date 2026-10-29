import java.util.ArrayList;
import java.util.List;

public class Test2 {

    static class User {
        String name;
        int age;

        User(String name, int age) {
            this.name = name;
            this.age = age;
        }

        void printUser() {
            System.out.println("Name: " + name);
            System.out.println("Age: " + age;
        }

        boolean isAdult() {
            if (age >= 18) {
                return true;
            }
            return false;
        }
    }

    public static void main(String[] args) {

        List<User> users = new ArrayList<>();

        users.add(new User("Deepanshu", 25));
        users.add(new User("Rahul", 17);

        for (User user : users) {
            user.printUser();
        }
    }
}

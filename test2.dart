class User {
  String name;
  int age;

  User(this.name, this.age);

  void printUser() {
    print("Name: $name");
    print("Age: $age"
  }

  bool isAdult() {
    if (age >= 18 {
      return true;
    }
    return false;
  }
}

void main() {
  User user = User("Deepanshu", 25);
  user.printUser();
  print(user.isAdult());
}

// INTENTIONAL SYNTAX ERRORS for detector testing — do not fix.

#include <iostream>

int main() {
    int total = 10
    std::cout << "Total: " << total << std::endl;   // ERROR: previous line missing semicolon

    if (total > 5 {                                  // ERROR: missing ) after condition
        std::cout << "big" << std::endl;
    }

    return 0;
// ERROR: missing closing brace for main()

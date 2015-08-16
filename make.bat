..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a init -t "Webframework" -v "1.8"
..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a import_syntax -s ".\wfw_objects"
..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a import_syntax -s ".\php"
..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a import_syntax -s ".\md"
..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a import_syntax -s ".\sql"

..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a add -i "..\Webframework\sql" -f "*.sql" -r
..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a add -i "..\Webframework\wfw\php" -f "*.php" -r
..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a add -i "..\Webframework\wfw\ctrl" -f "*.php" -r

..\Syntaxi\ConsoleApp\app\bin\Debug\app.exe -p ".\Webframework.prj" -a scan 

pause
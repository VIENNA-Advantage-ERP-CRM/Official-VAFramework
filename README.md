The VA Framework Repo is part of Vienna Advantage's core projects. It uses a model-driven approach to create objects at runtime by consuming information
from the Application Dictionary. Below are the steps to configure and build this repository in a local environment using Visual Studio 2019 and later.

Download the source code from the official account of VIENNA Advantage on Github:

https://github.com/VIENNA-Advantage-ERP-CRM/Official-VAFramework

Download the other required DLLs from http://viennaadvantage.com/downloads/Dll.rar. Extract all DLLs and place them in the "ViennaAdvantageWeb -> DLL" folder.

Download mail.dll from the following archive and place it in the ViennaAdvnatgeWeb/DLL folder:

https://www.limilabs.com/mail/download

Download the archive and locate mail.dll at the following location:

Mail\Examples\Lib

Copy it to the DLL folder.

Update the references using the NuGet Package Manager. Navigate to Tool -> Options -> NuGet Manager and set the package source to:

https://www.nuget.org/api/v2

If everything is correct, it will restore packages at the time of build. If not, update the packages manually with the help of the package.config from the 
Package Manager Console.

Download two folders:

5.1 /Required Files for Partner-kit Setup/5.x/VAS/1.2.6.0 (or the latest version)
5.2 /Required Files for Partner-kit Setup/5.x/ViennaBase/2.3.2.0 (or the latest version)

FTP Location Details:

User: Vienna
Password: Vienna&*^@456#
IP: betaftp.viennasolutions.com
Protocol: SFTP
Port: 22
Copy the contents of the "Areas" from both folders to the "Areas" folder of the project. Also, copy the htmlbin DLLs from both folders to the "DLL" folder of 
ViennaAdvantageWeb/Project. For example:

Copy VAS/1.2.6.0/Areas/ to ViennaAdvantageWeb/Areas/
Copy ViennaBase/2.3.2.0/Areas/ to ViennaAdvantageWeb/Areas/
Copy VAS/1.2.6.0/htmlbin/ and ViennaBase/2.3.20/htmlbin/ to ViennaAdvantageWeb/DLL
Build the VAModelAD, VIS, VISLogic projects, and other projects. After these steps, the solution will build successfully.

For more information, please download the VIENNA Advantage Technical document from the following location:

https://viennaadvantage.atlassian.net/wiki/spaces/VA/pages/9240589/Technology+and+Architecture

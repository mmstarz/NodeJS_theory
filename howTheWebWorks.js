/* How the Web Works

        ---------------------------- [User/Client] <--------------------
        |                              (Browser)                       |
        |                                  | enters                    |
        |                                  |                           |
        |                                  |                           |
        |                        [http://my-page.com]                  | 
    [Request] <-----------------    (Domain Lookup)               [Response]
        |                                                (e.g. HTML page, File, JSON, XML)
        |                                                              |
        |                                                              |
        |                                                              |
        |                                                              | 
        ------------------------->      [Server]    ------------------->
                                   (ip:10.212.212.12)
                                            |            / [Authentication]
                                            |           /  [Input Validation]
( Node.js, PHP,           ---------  [ <Your Code> ] <-----> [Database]
 ASP.NET, RubyOnRails... )                              \
                                                         \ [Business Logic]

Request/Respponse are provided by protocols:
1.HTTP (Hyper Text Transfer Protocol).
A protocol for transfering Data which is understood by browser and server.
2.HTTPS (Hyper Text Transfer Protocol Secure).
A protocol of HTTP + Data Encryption (during Transmission).


summary
Client=>Request=>Server=>Response=>Client
*/
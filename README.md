# NATS STREAMING SERVER -> EVENT BUS IMPLEMENTATION

***
***

**PAZNJA**:

NA [GITHUB STRANICI](https://github.com/nats-io/nats-streaming-server#nats-streaming-server) ZA NATS STREAMING SERVER, RECENO JE DA JE ON **U PROCESU DEPRECATION-A**, I DA **CE SE CRIRICAL BUG FIXES AND SECURITY FIXES APPLY-OVATI SVE DO JUNA 2023 GODINE**

**SAVETUJE SE KORISCENJE NECEG STO SE ZOVE [NATS JetStream](https://docs.nats.io/jetstream/jetstream)**

DAKLE JETSTREAM CE EVENTUALLLY DEPRICATE-OVATI UPOTREBU NATS STREMING SERVERA; A POSTO JE TAJ DEPRECATION PERIOD DALEKO, JA OVO PISEM U APRILU 2021. A NATS STREAMING SERVER NECE IMATI PODRSKU U JUNU 2023, JA CU IPAK KORISTITI NATS STREAMING SERVER

KASNIJE KADA OVO DEPRECATE-UJE I KADA NAUCIM MALO VISE O STREAMOVANJU EVENT-OVA, MOZDA CEMI BITI LAKSE DA USVOJIM NEKU DRUGU STREAMING TEHNOLOGIJU ZATO CU SE IPAK POSVETITI IMPLEMENTCIJI EVENT BUS-A SA NATS STREAMING SERVEROM

***
***

DA NASTAVIM IPAK SA TEMOM OVOG BRANCH-A

JA MOGU, SADA DA NAPRAVIM UI KOJI CE SLUZITI ZA SLANJE REQUEST-OVA PREME tickets CLIENTU, ILI MOGAO SAM DA POCNEM SA DEFINISANJEM orders MICROSERVICE-A

**ALI JA CU SE, USTVARI, IPAK POSVETITI DODAVANJEM EVENT BUS-A I WIREINGOM tickets MICROSERVICE-A TO IT**

ZASTO TO RADIM SADA

`PA RAZUMEVANJE STVARI KOJE CE DA EXPOSE-UJE EVENT BUS; A TO SU HUGE ISSUES IN HANDLING DATA BETWEEN tickets I orders MICROSERVICE-A`

# NATS STREAMING SERVER

DOCS: <https://docs.nats.io/nats-streaming-concepts/intro>

`NATS` JE RAZLICITA STVAR OD `NATS STREAMING SERVER`-A (BITNO JE DA ZNAS TERMINOLOSKU RAZLIKU) (TO SU DVA SEPARATE PROGRAMA)

**ALI DA BUDEM SAZETIJI, JA CU GOVORITI NATS KADA BUDEM GOVORIO O NATS STREAMING SERVERU, IAKO SU TO RAZLIITE STVARI**

ALI KADA CITAS DOKUMENTACIJU U LEVOM MENU-U, KOJI JE NEGDE PRI DNU MOZES DA CITAS O *"NATS STREAMING CONCEPTS"* , A IMAS I DEO KOJI JE *"DEVELOPING WITH NATS STREAMING"*

ONO STO CES VIDETI JESTE DA NATS IMPLEMENTIRA SOME EXTRAORDINARYLY IMPORTANT DESIGN DECISIONS KOJI CE AFFECT-OVATI OUR APP

**MI CEMO DA RUNN-UJEMO OFFICIAL 'nats-streaming' DOCKER IMAGE U KUBERNATES-U**

## IDEM NA DOCKER HUB-U I TRAZIM 'nats-streaming'

NASAO SAM

<https://hub.docker.com/_/nats-streaming>

DOKUMENTACIJA KOJU ZELIS DA VIIS NALAZI SE NA SAMOM KRAJU, POMENUTE STRANICE, A U PITANJU SU **`Commandline Options`**:

```zsh
Streaming Server Options:
    -cid, --cluster_id  <string>         Cluster ID (default: test-cluster)
    -st,  --store <string>               Store type: MEMORY|FILE|SQL (default: MEMORY)
          --dir <string>                 For FILE store type, this is the root directory
    -mc,  --max_channels <int>           Max number of channels (0 for unlimited)
    -msu, --max_subs <int>               Max number of subscriptions per channel (0 for unlimited)
    -mm,  --max_msgs <int>               Max number of messages per channel (0 for unlimited)
    -mb,  --max_bytes <size>             Max messages total size per channel (0 for unlimited)
    -ma,  --max_age <duration>           Max duration a message can be stored ("0s" for unlimited)
    -mi,  --max_inactivity <duration>    Max inactivity (no new message, no subscription) after which a channel can be garbage collected (0 for unlimited)
    -ns,  --nats_server <string>         Connect to this external NATS Server URL (embedded otherwise)
    -sc,  --stan_config <string>         Streaming server configuration file
    -hbi, --hb_interval <duration>       Interval at which server sends heartbeat to a client
    -hbt, --hb_timeout <duration>        How long server waits for a heartbeat response
    -hbf, --hb_fail_count <int>          Number of failed heartbeats before server closes the client connection
          --ft_group <string>            Name of the FT Group. A group can be 2 or more servers with a single active server and all sharing the same datastore
    -sl,  --signal <signal>[=<pid>]      Send signal to nats-streaming-server process (stop, quit, reopen, reload - only for embedded NATS Server)
          --encrypt <bool>               Specify if server should use encryption at rest
          --encryption_cipher <string>   Cipher to use for encryption. Currently support AES and CHAHA (ChaChaPoly). Defaults to AES
          --encryption_key <string>      Encryption Key. It is recommended to specify it through the NATS_STREAMING_ENCRYPTION_KEY environment variable instead
          --replace_durable <bool>       Replace the existing durable subscription instead of reporting a duplicate durable error

Streaming Server Clustering Options:
    --clustered <bool>                     Run the server in a clustered configuration (default: false)
    --cluster_node_id <string>             ID of the node within the cluster if there is no stored ID (default: random UUID)
    --cluster_bootstrap <bool>             Bootstrap the cluster if there is no existing state by electing self as leader (default: false)
    --cluster_peers <string, ...>          Comma separated list of cluster peer node IDs to bootstrap cluster state
    --cluster_log_path <string>            Directory to store log replication data
    --cluster_log_cache_size <int>         Number of log entries to cache in memory to reduce disk IO (default: 512)
    --cluster_log_snapshots <int>          Number of log snapshots to retain (default: 2)
    --cluster_trailing_logs <int>          Number of log entries to leave after a snapshot and compaction
    --cluster_sync <bool>                  Do a file sync after every write to the replication log and message store
    --cluster_raft_logging <bool>          Enable logging from the Raft library (disabled by default)
    --cluster_allow_add_remove_node <bool> Enable the ability to send NATS requests to the leader to add/remove cluster nodes

Streaming Server File Store Options:
    --file_compact_enabled <bool>        Enable file compaction
    --file_compact_frag <int>            File fragmentation threshold for compaction
    --file_compact_interval <int>        Minimum interval (in seconds) between file compactions
    --file_compact_min_size <size>       Minimum file size for compaction
    --file_buffer_size <size>            File buffer size (in bytes)
    --file_crc <bool>                    Enable file CRC-32 checksum
    --file_crc_poly <int>                Polynomial used to make the table used for CRC-32 checksum
    --file_sync <bool>                   Enable File.Sync on Flush
    --file_slice_max_msgs <int>          Maximum number of messages per file slice (subject to channel limits)
    --file_slice_max_bytes <size>        Maximum file slice size - including index file (subject to channel limits)
    --file_slice_max_age <duration>      Maximum file slice duration starting when the first message is stored (subject to channel limits)
    --file_slice_archive_script <string> Path to script to use if you want to archive a file slice being removed
    --file_fds_limit <int>               Store will try to use no more file descriptors than this given limit
    --file_parallel_recovery <int>       On startup, number of channels that can be recovered in parallel
    --file_truncate_bad_eof <bool>       Truncate files for which there is an unexpected EOF on recovery, dataloss may occur
    --file_read_buffer_size <size>       Size of messages read ahead buffer (0 to disable)
    --file_auto_sync <duration>          Interval at which the store should be automatically flushed and sync'ed on disk (<= 0 to disable)

Streaming Server SQL Store Options:
    --sql_driver <string>            Name of the SQL Driver ("mysql" or "postgres")
    --sql_source <string>            Datasource used when opening an SQL connection to the database
    --sql_no_caching <bool>          Enable/Disable caching for improved performance
    --sql_max_open_conns <int>       Maximum number of opened connections to the database
    --sql_bulk_insert_limit <int>    Maximum number of messages stored with a single SQL "INSERT" statement

Streaming Server TLS Options:
    -secure <bool>                   Use a TLS connection to the NATS server without
                                     verification; weaker than specifying certificates.
    -tls_client_key <string>         Client key for the streaming server
    -tls_client_cert <string>        Client certificate for the streaming server
    -tls_client_cacert <string>      Client certificate CA for the streaming server

Streaming Server Logging Options:
    -SD, --stan_debug=<bool>         Enable STAN debugging output
    -SV, --stan_trace=<bool>         Trace the raw STAN protocol
    -SDV                             Debug and trace STAN
         --syslog_name               On Windows, when running several servers as a service, use this name for the event source
    (See additional NATS logging options below)

Embedded NATS Server Options:
    -a, --addr <string>              Bind to host address (default: 0.0.0.0)
    -p, --port <int>                 Use port for clients (default: 4222)
    -P, --pid <string>               File to store PID
    -m, --http_port <int>            Use port for http monitoring
    -ms,--https_port <int>           Use port for https monitoring
    -c, --config <string>            Configuration file

Logging Options:
    -l, --log <string>               File to redirect log output
    -T, --logtime=<bool>             Timestamp log entries (default: true)
    -s, --syslog <bool>              Enable syslog as log method
    -r, --remote_syslog <string>     Syslog server addr (udp://localhost:514)
    -D, --debug=<bool>               Enable debugging output
    -V, --trace=<bool>               Trace the raw protocol
    -DV                              Debug and trace

Authorization Options:
        --user <string>              User required for connections
        --pass <string>              Password required for connections
        --auth <string>              Authorization token required for connections

TLS Options:
        --tls=<bool>                 Enable TLS, do not verify clients (default: false)
        --tlscert <string>           Server certificate file
        --tlskey <string>            Private key for server certificate
        --tlsverify=<bool>           Enable TLS, verify client certificates
        --tlscacert <string>         Client certificate CA for verification

NATS Clustering Options:
        --routes <string, ...>       Routes to solicit and connect
        --cluster <string>           Cluster URL for solicited routes

Common Options:
    -h, --help                       Show this message
    -v, --version                    Show version
        --help_tls                   TLS help.
```

**KAO STO VIDIS TU JE TONA OPCIJA KOJE MOZES PROVIDE-OVATI, KADA KREIRAMO DEPLOYMENT**

VIDECEMO KAKO DA IH STICK-UJEMO IN

**MI CEMO KORISTITI NEKE OD OVIH KOMANDI JER U NKEIM CASE-OVIMA NE ZELIM ODEFAULT SETTINGS SERVERA, JER ZELIM DA CUSTOM-IZUJEM PONASANJE SERVRA**

NEKE OD OPCIJA CE BITI VEOMA IMPORTANT TO SET

**NEK ATI PAGE SA OVIM KOMANDAMA BUDE OTVOREN TOKOM DEVELOPMENT-A**

<https://hub.docker.com/_/nats-streaming> (Commandline Options)

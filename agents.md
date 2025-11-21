# Agent Instructions

## Troubleshooting

### Port 3000 in use
If you cannot run the server on port 3000:
1. Run `lsof -i :3000` to get the PID of the process using the port.
2. Kill the process using `kill -9 <PID>`.

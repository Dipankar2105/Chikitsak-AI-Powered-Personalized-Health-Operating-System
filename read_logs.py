with open('uvicorn_log.txt', 'r', encoding='utf-16le', errors='replace') as f:
    lines = f.readlines()
    for line in lines[-500:]:
        print(line.strip())

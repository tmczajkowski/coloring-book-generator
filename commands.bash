git tag -a v0.0.23 -m "Release 0.0.23" && git push origin v0.0.23


ssh Patres@192.168.1.58 -p <PORT>
cd /volume2/docker/compose/coloring-book-generator/
sudo docker compose pull && sudo docker compose up -d --remove-orphans


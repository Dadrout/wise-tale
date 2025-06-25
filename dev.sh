#!/bin/bash

# Start both applications in parallel
(cd wisetale-landing && npm run dev) & 
(cd wisetale-app && npm run dev) &

# Wait for both processes
wait 
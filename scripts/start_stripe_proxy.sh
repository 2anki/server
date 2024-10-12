#!/bin/bash


PORT=2020
stripe listen --forward-to localhost:{PORT}/webhook

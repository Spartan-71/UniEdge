# UniEdge
Intelligent Autoscaling Platform for Unikernels and Edge Deployments.

## Overview

UniKraft is a lightweight, intelligent autoscaling platform built on top of Unikraft and KVM/QEMU, designed to bring cloud-grade scalability to resource-constrained or edge environments.

It automates deployment, scaling, and observability of Unikernel-based microservices like nginx, redis, or http-server — all while maintaining sub-second boot times and minimal resource overhead.

## Core Features

- Unikernel-based Deployment – Automatically builds and deploys Unikraft-based Unikernel images using modular configurations.
- Intelligent Autoscaling – Predictive scaling engine (using ML/heuristics) adjusts instances based on real-time metrics (CPU, memory, request rate).
- Edge-Ready Architecture – Optimized for local and edge devices using KVM/QEMU virtualization.
- Full Observability Stack – Integrated with Prometheus and Grafana for metrics collection and live visualization.
- Cost- & Energy-Aware Scaling – (Optional) Policies that balance performance with power efficiency.
- Plug-and-Play Apps – Supports common services (nginx, redis, http-server) with minimal setup.
- Modular Extensibility – Easily extendable to support new workloads or custom scaling logic.

#!/bin/bash
YAMLDIR=./yaml
LOGDIR=./log

PROC_NAME=$1.yaml


ProcNumber=`ps -ef | grep 'bee start' | grep $PROC_NAME|grep -v grep|wc -l`
FORCE=$3
if [ $FORCE -eq 1 ];then
	if [ $ProcNumber -eq 1 ];then
		ProcId=`ps -ef | grep 'bee start' | grep $PROC_NAME|grep -v grep| grep -v PPID|awk '{ print $2}'`
		echo "Kill -9 $ProcId"
		kill -9 $ProcId
		sleep 1	
	fi
fi

ProcNumber=`ps -ef | grep 'bee start' | grep $PROC_NAME|grep -v grep|wc -l`

if [ $ProcNumber -le 0 ];then
	echo "Pro is not run"
	echo "nohup bee start --config $YAMLDIR/$1.yaml  --swap-endpoint $2 > $LOGDIR/$1.txt 2>&1 &"
	nohup bee start --config $YAMLDIR/$1.yaml --swap-endpoint $2 > $LOGDIR/$1.txt 2>&1 &
else
	echo "Pro is running..."
fi

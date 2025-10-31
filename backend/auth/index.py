import json
import os
import hashlib
import secrets
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Player authentication and registration
    Args: event with httpMethod, body (username, password, email for register)
    Returns: HTTP response with player data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'register':
            username = body_data.get('username', '').strip()
            password = body_data.get('password', '')
            email = body_data.get('email', '').strip()
            avatar = body_data.get('avatar', '🧙')
            
            if not username or not password or not email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполни все поля'})
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            token = secrets.token_urlsafe(32)
            
            cur.execute(
                "INSERT INTO t_p64683754_best_game_analysis.players (username, password_hash, email, avatar) VALUES (%s, %s, %s, %s) RETURNING id, username, coins, gems, level, experience, health, max_health, attack, defense, avatar",
                (username, password_hash, email, avatar)
            )
            player = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'player': {
                        'id': player[0],
                        'username': player[1],
                        'coins': player[2],
                        'gems': player[3],
                        'level': player[4],
                        'experience': player[5],
                        'health': player[6],
                        'maxHealth': player[7],
                        'attack': player[8],
                        'defense': player[9],
                        'avatar': player[10]
                    }
                })
            }
        
        elif action == 'login':
            username = body_data.get('username', '').strip()
            password = body_data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введи логин и пароль'})
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                "SELECT id, username, coins, gems, level, experience, health, max_health, attack, defense, avatar FROM t_p64683754_best_game_analysis.players WHERE username = %s AND password_hash = %s",
                (username, password_hash)
            )
            player = cur.fetchone()
            
            if not player:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'})
                }
            
            cur.execute("UPDATE t_p64683754_best_game_analysis.players SET online = true, last_seen = NOW() WHERE id = %s", (player[0],))
            conn.commit()
            
            token = secrets.token_urlsafe(32)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'player': {
                        'id': player[0],
                        'username': player[1],
                        'coins': player[2],
                        'gems': player[3],
                        'level': player[4],
                        'experience': player[5],
                        'health': player[6],
                        'maxHealth': player[7],
                        'attack': player[8],
                        'defense': player[9],
                        'avatar': player[10]
                    }
                })
            }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unknown action'})
        }
    
    finally:
        cur.close()
        conn.close()
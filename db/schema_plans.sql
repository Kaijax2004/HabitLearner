-- plans 表
CREATE TABLE IF NOT EXISTS plans (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- plan_blocks 表
CREATE TABLE IF NOT EXISTS plan_blocks (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL,
  content JSON NOT NULL,
  "order" INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- 索引与约束
CREATE INDEX IF NOT EXISTS idx_plan_blocks_plan ON plan_blocks(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_blocks_order ON plan_blocks(plan_id, "order");
CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);


